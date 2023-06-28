const converter = (list: [Map<string, string>]) => {
  const items = list.map((val: any) => Object.fromEntries(val))
  const header = Object.keys(items[0])
  console.log('header', header)
  const csv = [
    header.join(','),
    ...items.map((row: any) =>
      header.map((fieldName) => JSON.stringify(row[fieldName])).join(',')
    ),
  ]

  console.log('csv', csv.join('\r\n'))
}

export default converter
