// Phaser3 配置
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
  // 创建文本对象
  const text = this.add.text(
    400,  // x 坐标：屏幕中央
    550,  // y 坐标：屏幕底部附近
    'Hello Phaser',  // 文本内容
    {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );
  
  // 设置文本的原点为中心，使其居中对齐
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);