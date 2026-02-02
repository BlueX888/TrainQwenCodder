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
  // 创建文字对象，位置设置在屏幕右上角
  const text = this.add.text(
    this.scale.width,  // x 坐标：屏幕右边
    0,                 // y 坐标：屏幕顶部
    'Hello Phaser',    // 文字内容
    {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置锚点为右上角 (1, 0)
  // 1 表示右边，0 表示顶部
  text.setOrigin(1, 0);
  
  // 可选：添加一些内边距，让文字不紧贴边缘
  text.setPosition(this.scale.width - 10, 10);
}

new Phaser.Game(config);