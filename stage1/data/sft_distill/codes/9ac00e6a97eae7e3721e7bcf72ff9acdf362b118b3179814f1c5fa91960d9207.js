const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 在屏幕右侧创建文字
  // x 坐标设置为屏幕宽度减去一定边距（例如 50 像素）
  // y 坐标设置为屏幕中央
  const text = this.add.text(
    750, // x 坐标：屏幕右侧，留 50 像素边距
    300, // y 坐标：屏幕垂直中央
    'Hello Phaser', // 文字内容
    {
      fontSize: '48px', // 字体大小
      color: '#ffffff', // 文字颜色
      fontFamily: 'Arial' // 字体
    }
  );
  
  // 设置文字原点为右中，使文字右对齐
  // setOrigin(1, 0.5) 表示原点在文字的右侧中央
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);