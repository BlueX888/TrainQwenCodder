// 完整的 Phaser3 代码 - 在屏幕下方显示文字
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
  // 本示例无需预加载资源
}

function create() {
  // 在屏幕下方创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  const text = this.add.text(400, 550, 'Hello Phaser', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 设置文本的原点为中心点，使其居中对齐
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);