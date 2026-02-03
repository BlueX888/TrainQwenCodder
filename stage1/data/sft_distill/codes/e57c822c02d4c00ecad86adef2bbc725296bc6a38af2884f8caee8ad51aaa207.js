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
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕右下角创建文字
  const text = this.add.text(
    this.game.config.width - 20,  // x 坐标：距离右边缘 20 像素
    this.game.config.height - 20, // y 坐标：距离下边缘 20 像素
    'Hello Phaser',               // 文字内容
    {
      fontSize: '32px',            // 字体大小 32 像素
      fontFamily: 'Arial',         // 字体
      color: '#ffffff',            // 白色文字
      backgroundColor: '#000000',  // 黑色背景（可选）
      padding: {                   // 文字内边距（可选）
        x: 10,
        y: 5
      }
    }
  );
  
  // 设置文字原点为右下角（1, 1），使文字从右下角对齐
  text.setOrigin(1, 1);
}

// 创建游戏实例
new Phaser.Game(config);