// Phaser3 游戏配置
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

// 预加载函数（本例不需要加载外部资源）
function preload() {
  // 无需加载资源
}

// 创建函数
function create() {
  // 在屏幕左侧创建文本
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  
  // 设置文本垂直居中对齐
  text.setOrigin(0, 0.5);
}

// 启动游戏
new Phaser.Game(config);