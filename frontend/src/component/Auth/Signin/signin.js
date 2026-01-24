import React ,{useEffect, useState}from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
// import { browserHistory } from 'react-router';
import { useNavigate } from "react-router-dom";
// import  { Redirect } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {clearErrors,login,loaduser} from '../../../actions/userAction'
import { useDispatch, useSelector } from "react-redux"
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="#">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));
export default function SignIn() {
  const dispatch = useDispatch();
  // const history = createHashHistory();
  let navigate= useNavigate();
  const {user,isAuthenticated,error}=useSelector(state=>state.user);
  const [loginError, setLoginError] = useState('');
  useEffect(() => {
    if (error) {
      setLoginError(error);
      dispatch(clearErrors())
    }
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, user, error, dispatch, clearErrors])
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    dispatch(login(data.get('email'),data.get('password')));
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };
  const classes = useStyles();
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h3" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Safal Marketing
        </Typography>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {loginError && (
          <div style={{ 
            width: '100%', 
            marginTop: '16px', 
            padding: '12px 16px',
            backgroundColor: '#fdeded',
            color: '#5f2120',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            fontSize: '14px'
          }}>
            {loginError}
          </div>
        )}
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
