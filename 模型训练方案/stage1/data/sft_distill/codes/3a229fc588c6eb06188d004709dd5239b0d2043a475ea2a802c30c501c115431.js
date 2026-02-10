const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationComplete = false;
let objects = [];
let statusText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置状态
  animationComplete = false;
  objects = [];

  // 创建标题文本
  const title = this.add.text(400, 50, '15个物体同步抖动动画', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  // 创建状态文本
  statusText = this.add.text(400, 550, '动画进行中...', {
    fontSize: '20px',
    color: '#ffff00'
  });
  statusText.setOrigin(0.5);

  // 定义颜色数组
  const colors = [
    0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7b731, 0x5f27cd,
    0x00d2d3, 0xff9ff3, 0x54a0ff, 0x48dbfb, 0xff6348,
    0x1dd1a1, 0xfeca57, 0xee5a6f, 0xc44569, 0x786fa6
  ];

  // 布局参数：3行5列
  const rows = 3;
  const cols = 5;
  const startX = 200;
  const startY = 180;
  const spacingX = 120;
  const spacingY = 120;
  const radius = 25;

  // 创建15个圆形物体
  for (let i = 0; i < 15; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;

    // 使用 Graphics 绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, radius);
    
    // 生成纹理
    const textureName = `circle${i}`;
    graphics.generateTexture(textureName, radius * 2, radius * 2);
    graphics.destroy();

    // 创建精灵
    const sprite = this.add.sprite(x, y, textureName);
    sprite.setOrigin(0.5);
    objects.push(sprite);

    // 添加编号文本
    const label = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
  }

  // 为所有物体创建同步抖动动画
  objects.forEach((obj, index) => {
    // X方向抖动
    this.tweens.add({
      targets: obj,
      x: obj.x + Phaser.Math.Between(-10, 10),
      duration: 50,
      yoyo: true,
      repeat: -1, // 无限重复
      ease: 'Sine.easeInOut'
    });

    // Y方向抖动
    this.tweens.add({
      targets: obj,
      y: obj.y + Phaser.Math.Between(-10, 10),
      duration: 60,
      yoyo: true,
      repeat: -1, // 无限重复
      ease: 'Sine.easeInOut'
    });

    // 轻微的旋转抖动
    this.tweens.add({
      targets: obj,
      angle: Phaser.Math.Between(-15, 15),
      duration: 80,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  });

  // 2.5秒后停止所有抖动动画
  this.time.delayedCall(2500, () => {
    // 停止所有 Tween
    this.tweens.getAllTweens().forEach(tween => {
      tween.stop();
    });

    // 将所有物体恢复到初始位置和角度
    objects.forEach((obj, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const targetX = startX + col * spacingX;
      const targetY = startY + row * spacingY;

      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        angle: 0,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });

    // 更新状态
    animationComplete = true;
    statusText.setText('动画已完成！');
    statusText.setColor('#00ff00');

    console.log('Animation complete! Status:', animationComplete);
  });

  // 添加提示文本
  const hint = this.add.text(400, 100, '抖动将在 2.5 秒后停止', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  hint.setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前示例中主要逻辑在 create 和 tweens 中完成
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { animationComplete, objects };
}