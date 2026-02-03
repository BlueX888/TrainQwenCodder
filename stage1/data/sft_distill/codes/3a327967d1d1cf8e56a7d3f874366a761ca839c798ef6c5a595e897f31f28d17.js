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
  // 创建文字对象，位置设置在屏幕右下角
  const text = this.add.text(
    this.cameras.main.width - 20,  // X 坐标：屏幕宽度 - 右边距
    this.cameras.main.height - 20, // Y 坐标：屏幕高度 - 下边距
    'Hello Phaser',
    {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );

  // 设置锚点为右下角 (1, 1)，使文字从右下角开始定位
  text.setOrigin(1, 1);
}

new Phaser.Game(config);