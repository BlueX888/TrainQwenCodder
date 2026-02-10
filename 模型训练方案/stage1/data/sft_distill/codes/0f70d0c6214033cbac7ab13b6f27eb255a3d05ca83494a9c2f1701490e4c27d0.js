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

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕右上角创建文字
  // 位置：x = 画布宽度 - 20（右边距），y = 20（上边距）
  const text = this.add.text(780, 20, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字原点为右上角 (1, 0)
  // 这样文字会从右上角开始对齐，而不是默认的左上角
  text.setOrigin(1, 0);
}

// 启动 Phaser 游戏
new Phaser.Game(config);