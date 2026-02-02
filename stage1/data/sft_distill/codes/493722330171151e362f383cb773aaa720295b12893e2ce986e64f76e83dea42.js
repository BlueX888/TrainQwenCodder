// 完整的 Phaser3 代码
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
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建文本对象
  const text = this.add.text(
    400,  // x 坐标（屏幕水平居中）
    550,  // y 坐标（屏幕下方）
    'Hello Phaser',  // 文本内容
    {
      fontSize: '48px',  // 字体大小
      fontFamily: 'Arial',  // 字体
      color: '#ffffff'  // 文字颜色
    }
  );
  
  // 设置文本原点为中心，使其居中对齐
  text.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);