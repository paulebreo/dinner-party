import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getImages} from '../store'
import history from '../history'

import MobileStepper from '@material-ui/core/MobileStepper'
import {withStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'

const styles = theme => ({
  root: {
    maxWidth: 400,
    flexGrow: 1
  },
  button: {
    margin: theme.spacing.unit
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 90,
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default
  },
  img: {
    height: 255,
    maxWidth: 415,
    minWidth: 415,
    overflow: 'hidden',
    display: 'block',
    width: '100%'
  }
})

class SinglePicture extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeStep: 0,
      customImages: this.moveToFront(
        this.props.match.params.pictureId,
        this.props.images
      )
    }
  }

  componentDidMount() {
    const partyId = this.props.match.params.partyId
    this.props.getImages(partyId)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.images !== this.props.images) {
      let newImages = this.moveToFront(
        this.props.match.params.pictureId,
        this.props.images
      )
      this.setState({customImages: newImages})
    }
  }

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1
    }))
  }

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1
    }))
  }

  moveToFront = (firstPictureId, images) => {
    let newArr = []
    let theIndex = null
    let extracted = null
    for (let i = 0; i < images.length; i++) {
      if (+firstPictureId === images[i].id) {
        theIndex = i
        break
      }
    }
    extracted = images.splice(theIndex, 1)

    newArr = [extracted[0], ...images]
    return newArr
  }
  getImageFromId = pictureId => {
    console.log('id>>.', pictureId)
    for (let i = 0; i < this.props.images.length; i++) {
      if (this.props.images[i].id === +pictureId) {
        return i
      }
    }
  }

  render() {
    const maxSteps = this.props.images.length
    const {classes, theme} = this.props
    const {activeStep} = this.state

    if (this.props.images.length) {
      return (
        <div className={classes.root}>
          <Paper square elevation={30} className={classes.header}>
            <Button
              variant="outlined"
              className={classes.button}
              onClick={() => history.goBack()}
            >
              Back
            </Button>
          </Paper>
          <img
            className={classes.img}
            src={this.state.customImages[this.state.activeStep].imageUrl}
          />

          <MobileStepper
            steps={this.state.customImages.length}
            position="static"
            activeStep={activeStep}
            className={classes.mobileStepper}
            nextButton={
              <Button
                size="small"
                onClick={this.handleNext}
                disabled={activeStep === this.state.customImages.length - 1}
              >
                Next
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={this.handleBack}
                disabled={activeStep === 0}
              >
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />
        </div>
      )
    } else {
      return null
    }
  }
}

const mapState = state => ({
  images: state.images
})

const mapDispatch = dispatch => ({
  getImages: partyId => dispatch(getImages(partyId))
})

export default connect(mapState, mapDispatch)(
  withStyles(styles, {withTheme: true})(SinglePicture)
)
