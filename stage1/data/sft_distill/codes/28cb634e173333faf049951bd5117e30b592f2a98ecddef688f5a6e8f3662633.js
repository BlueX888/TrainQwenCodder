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
  // 在屏幕左侧显示文字
  // x: 50 让文字距离左边有一定间距
  // y: 300 垂直居中
  this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
}

new Phaser.Game(config);