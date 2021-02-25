import React, { useEffect, useState } from "react";
import { Button, Container, Grid, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { isValidEmail } from "../utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import { isValid } from "date-fns";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
  },
}));

const LoginPage = ({ onLoginSuccess }) => {
  const classes = useStyles();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [hasError, setHasError] = useState(false);

  const onSubmitForm = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setHasError(true);
      return;
    }

    // Mock API call for authentication.
    fetch("/api/token", {
      method: "post",
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const authToken = data.access_token;
        const userId = data.user_id;
        if (!authToken) {
          toast.error("Email and/or password doesn't match");
          return;
        }
        onLoginSuccess(authToken);
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("currentUserId", userId);
      })
      .catch((err) => console.log(err));
  };
  return (
    <Container className={classes.container} maxWidth="xs">
      <form>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  error={(hasError && !email) || (email && !isValidEmail(email))}
                  helperText={
                    hasError && !email
                      ? "Email can not be empty"
                      : email && !isValidEmail(email)
                      ? "Please insert valid email address"
                      : ""
                  }
                  fullWidth
                  label="Email"
                  name="email"
                  size="small"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={hasError && !password}
                  helperText={
                    hasError && !password ? "Password can not be empty" : null
                  }
                  fullWidth
                  label="Password"
                  name="password"
                  size="small"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="secondary"
              fullWidth
              type="submit"
              variant="contained"
              onClick={onSubmitForm}
            >
              Log in
            </Button>
          </Grid>
        </Grid>
      </form>
      <ToastContainer />
    </Container>
  );
};

export default LoginPage;
