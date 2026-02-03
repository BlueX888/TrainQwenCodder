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
  // 本任务无需预加载资源
}

function create() {
  // 创建文字对象
  const text = this.add.text(0, 0, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });

  // 设置文字原点为右下角 (1, 1)
  text.setOrigin(1, 1);

  // 将文字定位到屏幕右下角
  // x 坐标为画布宽度，y 坐标为画布高度
  text.setPosition(this.scale.width, this.scale.height);
}

new Phaser.Game(config);