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
  // 使用 Graphics 绘制绿色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制星形路径
  const star = new Phaser.Geom.Star(64, 64, 5, 32, 64, 0);
  graphics.fillPoints(star.points, true);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
  
  // 创建星形精灵
  const starSprite = this.add.sprite(400, 300, 'star');
  
  // 创建弹跳动画
  // 使用 timeline 组合多个动画阶段
  this.tweens.timeline({
    targets: starSprite,
    loop: -1, // 无限循环
    duration: 3000, // 总时长3秒
    tweens: [
      {
        // 上升阶段 - 向上移动并稍微缩小
        y: 200,
        scaleX: 0.9,
        scaleY: 1.1,
        duration: 1000,
        ease: 'Quad.easeOut'
      },
      {
        // 下落阶段 - 向下移动
        y: 300,
        scaleX: 1,
        scaleY: 1,
        duration: 1000,
        ease: 'Bounce.easeOut'
      },
      {
        // 着地挤压效果
        scaleX: 1.2,
        scaleY: 0.8,
        duration: 150,
        ease: 'Quad.easeOut'
      },
      {
        // 恢复形状
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Quad.easeIn'
      },
      {
        // 停顿
        duration: 700
      }
    ]
  });
  
  // 添加旋转动画增强效果
  this.tweens.add({
    targets: starSprite,
    angle: 360,
    duration: 3000,
    repeat: -1,
    ease: 'Linear'
  });
  
  // 添加说明文字
  this.add.text(400, 50, '绿色星形弹跳动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);