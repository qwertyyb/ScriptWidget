// 
// JSWidget 
// https://qwertyyb.github.io/JSWidget/
// 

const API_URL = "https://episodate.com/api/show-details?q="

const colors = {
  primary: "#080808",
  secondary: "green",
  text: {
    primary: "white",
    secondary: "green"
  }
}

const series = [
  "the-lord-of-the-rings",
  "house-of-the-dragon"
]

const fetchSeries = async seriesList => {
  let response = []

  for (let series of seriesList) {
    response.push(
      JSON.parse(
        await fetch(API_URL + series)
      )
    )
  }
  return response
}

const getTimeLeft = airDate => {

  let res
  const millis = airDate - Date.now()
  const secondsLeft = millis / 1000

  const getDays = seconds => {
    return Math.round(seconds / (3600 * 24))
  }

  const getHours = seconds => {
    return Math.round(seconds % (3600 * 24) / 3600)
  }

  const getMinutes = seconds => {
    return Math.round(seconds % 3600 / 60)
  }
  
  if (getDays(secondsLeft) > 0) {
    res = getDays(secondsLeft) + "d "
    res += getHours(secondsLeft) + "h "
    
  } else if (getHours(secondsLeft) > 0) {
    res = getHours(secondsLeft) + " h "
    
  } else {
    res = getMinutes(secondsLeft) + " m "
  }
    
  return res + "left"
}

const Logo = ({logoPath}) => {
   return (
    <stack>
       <image
         url={logoPath}
         size={{width: 40, height: 40}} justify="end"
       />
       <rect
         color={colors.secondary}
         stroke="1"
         size={{width: 40, height: 40}}
       />
    </stack>
  )
}

const Entry = ({info}) => {

  const getNextEpisode = countdown => 
    `s${countdown.season}e${countdown.episode}`

  const nextEpisodeRemaining = countdown => {
    const airDate = countdown.air_date
      .replace(" ", "T") + "Z"
    
    return getTimeLeft(new Date(airDate))
  }
  
  return (
    <col
      align="start" 
    >
      <row
        align="start" 
      >
        <Logo 
          logoPath={info.image_path}
        />
        <col
          align="start"
        >
          <text 
            font={14}
            size={{width: 200, height: 15}} justify="start"
            color={colors.text.primary}
          >
            {info.name}
          </text>
          <row>
            <text
              font="caption2"
              size={{width: 50, height: 15}} justify="start"
              color={colors.text.secondary}
            >
              {
                info.countdown === null ? "ended"
                : getNextEpisode(info.countdown)
              }
            </text>
            <text
              size={{width: 120, height: 15}} justify="end"
              font="caption2"
              color={colors.text.secondary}
            >
              {
                info.countdown === null ? ""
                : nextEpisodeRemaining(info.countdown)
              }
            </text>
          </row>
        </col>
        <spacer/>
      </row>
    </col>
  )
}

const seriesJson = await fetchSeries(series)

$render(
  <stack
    backgroundColor={colors.primary} 
  > 
    <col 
      padding={{top: 10, trailing: 10, bottom: 10, leading: 20}} 
      size="max" align="start"
    >
      {
        seriesJson?.map(series =>
          <Entry
            info={series.tvShow}
          />
        )
      }
    </col>
  </stack>
);
