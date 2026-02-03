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
  // 在屏幕右侧显示文字 "Hello Phaser"
  // x 坐标设置为靠近右边界，y 坐标居中
  const text = this.add.text(550, 260, 'Hello Phaser', {
    fontSize: '80px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为左上角（默认值），确保文本不会超出画布
  text.setOrigin(0, 0);
}

new Phaser.Game(config);