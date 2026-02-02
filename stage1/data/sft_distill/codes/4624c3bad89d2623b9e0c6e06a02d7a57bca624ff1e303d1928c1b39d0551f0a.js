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
  // 无需预加载资源
}

function create() {
  // 在屏幕右上角创建文本
  // 位置设置为 (800, 0)，即画布的右上角
  const text = this.add.text(800, 0, 'Hello Phaser', {
    fontSize: '48px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本锚点为右上角 (1, 0)
  // 这样文本会从右上角开始向左下方延伸
  text.setOrigin(1, 0);
  
  // 可选：添加一些内边距，让文本不紧贴边缘
  text.setPosition(780, 20);
}

new Phaser.Game(config);