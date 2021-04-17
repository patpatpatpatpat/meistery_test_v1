import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Login from "./Login";
import useStyles from "../layout/Style";
import Main from "../components/Main";
import { belongsTo, createServer, hasMany, Model } from "miragejs";
import saleData from "../api/sales_data";
import userData from "../api/user";
import {
  getAverageSale,
  getMostExpensiveProduct,
  getMostRevenueEarningProduct,
  getMostSoldProduct,
} from "../utils/helpers";
import { generateToken } from "../utils/mockApiHelper";
import { setAuthToken } from "../api/axios.instance";
import { logout } from "../utils/mockApiHelper";
import { logoutService } from "../services/auth.service";
import { toast } from "react-toastify";

createServer({
  models: {
    user: Model,
    sale: Model.extend({
      user: belongsTo(),
    }),
    userinformation: Model,
  },

  seeds(server) {
    userData.forEach((user) => {
      server.create("user", user);
    });
  },

  routes() {
    // this.post("/api/token", (schema, request) => {
    //   var users = schema.users.all().models;
    //   var data = JSON.parse(request.requestBody);

    //   const user = users.find((item) => {
    //     return item.email === data.email && item.password === data.password;
    //   });

    //   if (user && user.password === data.password) {
    //     var token = generateToken(64);
    //     return {
    //       access_token: token,
    //       token_type: "Bearer",
    //       user_id: user.id,
    //     };
    //   } else {
    //     return Response(
    //       401,
    //       {},
    //       {
    //         code: 401,
    //         message: "Invalid username and/or password, please try again",
    //       }
    //     );
    //   }
    // });

    this.post("/api/userinformation", (schema, request) => {
      const payLoad = JSON.parse(request.requestBody);
      schema.db.userinformations.insert(payLoad);
      return { userinformation: payLoad };
    });

    this.get("/api/userinformation/:userId", (schema, request) => {
      const currentUserInfo = schema.userinformations
        .all()
        .models.find((item) => {
          return item.userId === request.params.userId;
        });

      return { userInformation: currentUserInfo };
    });

    this.post("/api/sales", (schema, request) => {
      const payLoad = JSON.parse(request.requestBody);
      schema.db.sales.insert(payLoad);
      return { sales: payLoad };
    });

    this.get("/api/sales/:userId", (schema, request) => {
      const currentUserId = request.params.userId;
      const salesData = schema.sales.all().models;
      const currentUserSalesData = salesData.filter(
        (item) => item.userId === currentUserId
      );
      return { sales: currentUserSalesData };
    });

    this.get("/api/aggregated_data/:userId", (schema, request) => {
      const currentUserId = request.params.userId;
      const salesData = schema.sales.all().models;
      const currentUserSalesData = salesData.filter(
        (item) => item.userId === currentUserId
      );
      return {
        aggregatedData: {
          avgSaleCurrentUser: getAverageSale(currentUserSalesData),
          avgSale: getAverageSale(salesData),
          mostExpensiveProduct: getMostExpensiveProduct(currentUserSalesData),
          mostRevenueEarningProduct: getMostRevenueEarningProduct(
            currentUserSalesData
          ),
          mostSoldProduct: getMostSoldProduct(currentUserSalesData),
        },
      };
    });

    this.passthrough();
    this.passthrough(`http://localhost:8000/**`);
  },
});

export const DashboardContext = React.createContext({});

const Dashboard = () => {
  const classes = useStyles();
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("currentUserId")
  );
  const logoutProcess = () => {
    logoutService()
      .then((response) => {
        logout();
        setToken(undefined);
        setAuthToken(undefined);
      })
      .catch((e) => {
        toast.error(e.toString());
      });
  };

  if (!token) {
    return <Login setToken={setToken} setCurrentUserId={setCurrentUserId} />;
  } else {
    setAuthToken(token);
  }
  return (
    <DashboardContext.Provider
      value={{
        token,
        setToken,
        currentUserId,
        setCurrentUserId,
        logoutProcess,
      }}
    >
      <Paper className={classes.control}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Main />
          </Grid>
        </Grid>
      </Paper>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
