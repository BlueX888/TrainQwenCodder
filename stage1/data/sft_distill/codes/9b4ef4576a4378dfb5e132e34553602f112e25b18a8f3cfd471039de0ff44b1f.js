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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心点在原点）
  graphics.beginPath();
  graphics.moveTo(0, -40);      // 顶点
  graphics.lineTo(-35, 30);     // 左下角
  graphics.lineTo(35, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 70, 70);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建弹跳动画
  // 使用 yoyo 和缩放效果模拟真实的弹跳
  this.tweens.add({
    targets: triangle,
    y: 150,                    // 向上弹跳到 y=150
    scaleY: 1.1,               // 垂直拉伸（起跳时的拉伸效果）
    duration: 750,             // 上升阶段 0.75 秒
    ease: 'Quad.easeOut',      // 减速上升
    yoyo: true,                // 返回原位置
    hold: 0,                   // 在顶点不停留
    repeat: -1,                // 无限循环
    repeatDelay: 0,            // 无延迟
    onYoyo: function() {
      // 下落阶段，三角形被压扁（模拟着地时的形变）
      this.tweens.add({
        targets: triangle,
        scaleY: 0.8,           // 压扁效果
        scaleX: 1.1,           // 横向拉伸
        duration: 375,         // 0.375 秒
        ease: 'Quad.easeIn',   // 加速下落
        yoyo: true,            // 恢复形状
        hold: 100              // 在压扁状态保持 0.1 秒
      });
    },
    callbackScope: this
  });
  
  // 添加说明文字
  const text = this.add.text(400, 500, '绿色三角形弹跳动画\n循环周期：3秒', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);