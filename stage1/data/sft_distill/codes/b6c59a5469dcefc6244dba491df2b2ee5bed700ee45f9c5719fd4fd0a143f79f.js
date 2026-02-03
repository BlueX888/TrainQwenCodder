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
  // 在屏幕右侧显示文字
  // x 坐标设置为画布宽度减去一定边距
  // y 坐标设置为画布中心
  const text = this.add.text(
    this.cameras.main.width - 20, // 距离右边缘 20 像素
    this.cameras.main.height / 2,  // 垂直居中
    'Hello Phaser',
    {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置文本锚点为右中，使文本从右侧对齐
  text.setOrigin(1, 0.5);
}

new Phaser.Game(config);