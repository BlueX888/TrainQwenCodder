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
  // 此任务无需预加载资源
}

function create() {
  // 在屏幕左下角创建文字
  // x: 20 表示距离左边 20 像素
  // y: 580 表示距离顶部 580 像素（接近底部）
  const text = this.add.text(20, 580, 'Hello Phaser', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文字原点为左下角 (0, 1)
  // 这样文字会从设置的坐标点向上和向右显示
  text.setOrigin(0, 1);
}

// 创建游戏实例
new Phaser.Game(config);