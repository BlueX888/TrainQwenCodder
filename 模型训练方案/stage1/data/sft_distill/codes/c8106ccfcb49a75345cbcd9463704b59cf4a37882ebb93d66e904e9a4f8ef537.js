// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 在屏幕左下角创建文本
  // x: 20 为左侧留白，y: 520 为距离顶部的位置（600 - 80 = 520，使文本底部对齐底部）
  const text = this.add.text(20, 520, 'Hello Phaser', {
    fontFamily: 'Arial',
    fontSize: '80px',
    color: '#ffffff',
    fontStyle: 'bold'
  });

  // 设置文本原点为左下角，使定位更精确
  text.setOrigin(0, 1);
}

new Phaser.Game(config);