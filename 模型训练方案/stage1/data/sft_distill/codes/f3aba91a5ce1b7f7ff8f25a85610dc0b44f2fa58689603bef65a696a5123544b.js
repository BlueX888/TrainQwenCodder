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
  // 在屏幕左上角创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  const text = this.add.text(10, 10, 'Hello Phaser', {
    fontSize: '80px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 可选：设置文本原点为左上角（默认就是左上角，这里显式说明）
  text.setOrigin(0, 0);
}

// 启动 Phaser 游戏
new Phaser.Game(config);