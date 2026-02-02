const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 本任务不需要预加载资源
}

function create() {
  // 在屏幕右下角创建文本
  // 位置：距离右边缘 20px，距离底部边缘 20px
  const text = this.add.text(
    780,  // x 坐标：800 - 20
    580,  // y 坐标：600 - 20
    'Hello Phaser',
    {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 设置文本原点为右下角 (1, 1)
  // 这样文本会以右下角为基准点进行定位
  text.setOrigin(1, 1);
}

new Phaser.Game(config);