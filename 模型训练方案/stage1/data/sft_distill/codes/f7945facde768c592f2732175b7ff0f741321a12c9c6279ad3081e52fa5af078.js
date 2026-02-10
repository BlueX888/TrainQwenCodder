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
  // 本任务不需要预加载资源
}

function create() {
  // 创建文字对象，位置设置在右下角（留 20 像素边距）
  const text = this.add.text(
    780,  // x 坐标：宽度 800 - 边距 20
    580,  // y 坐标：高度 600 - 边距 20
    'Hello Phaser',
    {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置锚点为右下角 (1, 1)，使文字从右下角对齐
  text.setOrigin(1, 1);
}

new Phaser.Game(config);