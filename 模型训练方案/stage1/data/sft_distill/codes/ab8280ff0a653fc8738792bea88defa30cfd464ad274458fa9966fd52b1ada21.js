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
  // 本示例不需要预加载资源
}

function create() {
  // 在屏幕中央创建文本对象
  // 参数：x坐标, y坐标, 文本内容, 样式配置
  const text = this.add.text(
    400,  // x 坐标（屏幕中心）
    300,  // y 坐标（屏幕中心）
    'Hello Phaser',  // 文本内容
    {
      fontSize: '48px',  // 字体大小
      color: '#ffffff',  // 文字颜色（白色）
      fontFamily: 'Arial'  // 字体family
    }
  );

  // 设置文本的原点为中心，使其真正居中显示
  text.setOrigin(0.5, 0.5);
}

// 创建并启动游戏实例
new Phaser.Game(config);