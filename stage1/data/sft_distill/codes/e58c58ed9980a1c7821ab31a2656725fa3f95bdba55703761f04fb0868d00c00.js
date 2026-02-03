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
  // 在左上角创建文字对象
  // 参数: x坐标, y坐标, 文字内容, 样式配置
  this.add.text(0, 0, 'Hello Phaser', {
    fontSize: '80px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
}

new Phaser.Game(config);