// 完整的 Phaser3 代码 - 在屏幕右侧显示文字
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 在屏幕右侧创建文字对象
  // x 坐标设置为画布宽度减去一定边距，y 坐标设置为画布中央
  const text = this.add.text(
    700, // x 坐标，靠近右侧（800 - 100 的边距）
    300, // y 坐标，垂直居中
    'Hello Phaser', // 文字内容
    {
      fontSize: '32px', // 字体大小
      color: '#ffffff', // 文字颜色为白色
      fontFamily: 'Arial' // 字体家族
    }
  );
  
  // 设置文字的原点为右中，使其右对齐更精确
  text.setOrigin(1, 0.5);
}

// 创建游戏实例
new Phaser.Game(config);