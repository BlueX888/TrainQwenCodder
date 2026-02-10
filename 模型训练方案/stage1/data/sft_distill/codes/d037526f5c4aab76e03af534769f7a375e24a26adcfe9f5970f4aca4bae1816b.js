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
  // 在右上角创建文本
  // 位置：x = 画布宽度 - 20（右边距），y = 20（上边距）
  const text = this.add.text(
    this.cameras.main.width - 20,  // x 坐标：右侧边距 20px
    20,                              // y 坐标：上边距 20px
    'Hello Phaser',                  // 文本内容
    {
      fontSize: '48px',              // 字体大小 48px
      color: '#ffffff',              // 白色文字
      fontFamily: 'Arial'            // 字体
    }
  );
  
  // 设置原点为右上角 (1, 0)，使文本从右上角定位
  text.setOrigin(1, 0);
}

new Phaser.Game(config);