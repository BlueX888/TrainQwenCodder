// Phaser3 游戏配置
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

// 预加载资源（本例无需加载外部资源）
function preload() {
  // 无需预加载
}

// 创建游戏对象
function create() {
  // 在屏幕右侧创建文本对象
  // x: 700 表示距离左边界 700 像素（接近右侧）
  // y: 300 表示垂直居中
  const text = this.add.text(700, 300, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本锚点为右中心 (1, 0.5)
  // 1 表示水平方向右对齐，0.5 表示垂直方向居中
  text.setOrigin(1, 0.5);
}

// 启动游戏
new Phaser.Game(config);