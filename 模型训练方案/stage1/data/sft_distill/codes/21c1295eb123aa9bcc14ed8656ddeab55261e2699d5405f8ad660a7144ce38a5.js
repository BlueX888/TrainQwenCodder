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
  // 在屏幕右下角创建文本
  // 位置：右边距 20px，下边距 20px
  const text = this.add.text(
    this.cameras.main.width - 20,  // x: 画布宽度 - 右边距
    this.cameras.main.height - 20, // y: 画布高度 - 下边距
    'Hello Phaser',
    {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );
  
  // 设置原点为右下角 (1, 1)，使文本从右下角对齐
  text.setOrigin(1, 1);
}

new Phaser.Game(config);