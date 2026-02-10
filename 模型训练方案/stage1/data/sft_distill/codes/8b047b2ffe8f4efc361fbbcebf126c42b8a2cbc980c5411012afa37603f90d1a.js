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
  // 不需要加载外部资源
}

function create() {
  // 创建橙色三角形
  const triangle = this.add.triangle(
    400,           // x 位置（中心）
    300,           // y 位置（中心）
    0, -50,        // 顶点1 (顶部)
    -50, 50,       // 顶点2 (左下)
    50, 50,        // 顶点3 (右下)
    0xff6600       // 橙色
  );

  // 创建缩放动画
  this.tweens.add({
    targets: triangle,        // 动画目标
    scale: 1.5,              // 缩放到 1.5 倍
    duration: 1500,          // 单程 1.5 秒
    yoyo: true,              // 来回播放（放大后缩小）
    repeat: -1,              // 无限循环
    ease: 'Sine.easeInOut'   // 缓动函数，使动画更平滑
  });

  // 添加提示文字
  this.add.text(400, 550, 'Orange Triangle Scaling Animation (3s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);