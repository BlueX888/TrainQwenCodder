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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);      // 左下
  graphics.lineTo(90, 90);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('orangeTriangle', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'orangeTriangle');
  
  // 设置初始缩放
  triangle.setScale(1);
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    scaleX: 2,                   // X 轴缩放到 2 倍
    scaleY: 2,                   // Y 轴缩放到 2 倍
    duration: 1500,              // 单程 1.5 秒
    yoyo: true,                  // 往返动画（放大后缩小）
    repeat: -1,                  // 无限循环
    ease: 'Sine.easeInOut'       // 平滑的缓动效果
  });
  
  // 添加提示文字
  this.add.text(400, 550, 'Orange Triangle Scaling Animation (3s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);