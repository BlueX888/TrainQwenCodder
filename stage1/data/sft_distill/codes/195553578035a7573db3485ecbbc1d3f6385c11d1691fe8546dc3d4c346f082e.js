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
  // 本示例不需要预加载任何资源
}

function create() {
  // 在屏幕右上角创建文本
  // 位置设置为 (800, 0)，即画布右上角
  const text = this.add.text(800, 0, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为右上角 (1, 0)
  // 这样文本会从右上角开始对齐，而不是默认的左上角
  text.setOrigin(1, 0);
  
  // 可选：添加一些内边距，使文本不紧贴边缘
  text.setPadding(10, 10, 10, 10);
}

// 启动游戏
new Phaser.Game(config);