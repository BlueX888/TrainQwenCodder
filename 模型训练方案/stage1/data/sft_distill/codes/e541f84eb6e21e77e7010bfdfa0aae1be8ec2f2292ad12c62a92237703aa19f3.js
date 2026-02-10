// 完整的 Phaser3 代码
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
  // 本示例不需要预加载任何资源
}

function create() {
  // 在左上角位置 (10, 10) 创建文本
  // 设置字体大小为 32 像素，颜色为白色
  this.add.text(10, 10, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
}

// 创建并启动游戏
new Phaser.Game(config);