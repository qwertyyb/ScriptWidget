const getHot = async () => {
  try {
    const response = await $http.get('https://www.v2ex.com/api/topics/hot.json', {
      timeoutInterval: 6
    })
    const json = JSON.parse(response)

    // 原生JavaScript日期格式化
    const date = new Date()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const updateTime = `${month}-${day} ${hour}:${minute}`

    const data = { list: json, updateTime: updateTime }
    $storage.setJSON('v2ex_hot', data)
    return data
  } catch (err) {
    const cachedData = $storage.getJSON('v2ex_hot')
    if (cachedData) {
      return cachedData
    }
    throw err
  }
}

const data = await getHot()
const { list, updateTime } = data

const size = $getenv('widget-size')
const count = size === 'large' ? 20 : 6

$render(
  <col padding={{ vertical: 6 }} spacing={0}>
    {/* 头部 */}
    <row padding={{ leading: 10, trailing: 10 }}>
      <link url="https://v2ex.com">
        <text font={{ name: 'custom', weight: 'bold', size: 12 }} opacity={0.7}>
          V2EX热帖
        </text>
      </link>
      <spacer />
      <text font={10} opacity={0.6}>
        {updateTime}
      </text>
    </row>

    <spacer length={3} />

    {/* 分割线 */}
    <divider thickness={1} color="#f1f1f1" />

    <spacer length={3} />

    {/* 热帖列表 */}
    <col spacing={6}>
      {list.slice(0, count).map((item, index) => (
        <row key={item.id} size={{ width: 'fill' }} justify="start" padding={{ horizontal: 10 }}>
          <link url={item.url}>
            <row size={{ width: 340 }} justify="start">
              <text
                font={12}
                opacity={0.6}
                padding={{ top: 0, leading: 0, trailing: 0 }}
              >
                {index + 1}
              </text>
              <text font={14} lineLimit={1} flex={1}>
                {item.title}
              </text>
              <spacer />
              <text
                font={{ name: 'body', weight: 'bold', size: 10 }}
                opacity={0.6}
                padding={{ top: 2, trailing: 10 }}
              >
                {item.replies}回复
              </text>
            </row>
          </link>
        </row>
      ))}
    </col>
  </col>
)