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
  // 在屏幕右上角创建文本对象
  const text = this.add.text(800, 0, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本原点为右上角，使其对齐到屏幕右上角
  text.setOrigin(1, 0);
}

new Phaser.Game(config);