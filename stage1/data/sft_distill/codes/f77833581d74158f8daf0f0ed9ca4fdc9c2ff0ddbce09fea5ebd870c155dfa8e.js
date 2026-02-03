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
  // 不需要预加载资源
}

function create() {
  // 在屏幕右下角创建文字
  // 位置设置为画布的右下角坐标
  const text = this.add.text(
    this.game.config.width,  // x: 800
    this.game.config.height, // y: 600
    'Hello Phaser',
    {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置文字原点为右下角 (1, 1)
  // 这样文字会从右下角开始绘制，而不是默认的左上角
  text.setOrigin(1, 1);
}

new Phaser.Game(config);