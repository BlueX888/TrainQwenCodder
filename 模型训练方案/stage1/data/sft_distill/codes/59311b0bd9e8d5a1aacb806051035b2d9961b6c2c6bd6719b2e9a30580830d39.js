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
  // 创建文字对象
  const text = this.add.text(
    this.cameras.main.width - 20,  // x 坐标：画布宽度 - 右边距
    this.cameras.main.height - 20, // y 坐标：画布高度 - 下边距
    'Hello Phaser',                // 文字内容
    {
      fontSize: '48px',            // 字体大小
      color: '#ffffff',            // 文字颜色
      fontFamily: 'Arial'          // 字体
    }
  );
  
  // 设置锚点为右下角 (1, 1)，使文字从右下角对齐
  text.setOrigin(1, 1);
}

new Phaser.Game(config);