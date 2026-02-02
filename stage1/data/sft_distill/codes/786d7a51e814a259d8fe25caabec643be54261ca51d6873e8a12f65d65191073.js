// 完整的 Phaser3 代码 - 在屏幕左侧显示文字
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
  // 此任务不需要预加载资源
}

function create() {
  // 在屏幕左侧 (x: 50) 创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  const text = this.add.text(50, 300, 'Hello Phaser', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本垂直居中对齐
  text.setOrigin(0, 0.5);
}

// 启动游戏
new Phaser.Game(config);