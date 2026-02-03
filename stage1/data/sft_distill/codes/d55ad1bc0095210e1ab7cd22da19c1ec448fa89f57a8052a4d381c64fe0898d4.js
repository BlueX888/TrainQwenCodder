// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态变量（可验证的状态信号）
let killCount = 0;
let statusText;
let enemy;
let particleEmitter;

function preload() {
  // 使用 Graphics 创建黄色敌人纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('yellowEnemy', 50, 50);
  graphics.destroy();

  // 创建粒子纹理（小圆点）
  const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  particleGraphics.fillStyle(0xffaa00, 1); // 橙黄色粒子
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建状态文本显示
  statusText = this.add.text(16, 16, 'Kills: 0\nClick the yellow enemy to destroy it!', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  statusText.setDepth(100);

  // 创建黄色敌人
  enemy = this.physics.add.sprite(400, 300, 'yellowEnemy');
  enemy.setInteractive();
  enemy.setScale(1.5);

  // 创建粒子发射器（初始状态不发射）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 300 }, // 速度范围：向四周扩散
    angle: { min: 0, max: 360 }, // 全方位发射
    scale: { start: 1, end: 0 }, // 粒子从正常大小缩小到消失
    alpha: { start: 1, end: 0 }, // 透明度从1到0
    lifespan: 4000, // 持续4秒
    quantity: 20, // 每次发射20个粒子
    frequency: -1, // 不自动发射，手动触发
    blendMode: 'ADD', // 叠加混合模式，更炫酷
    gravityY: 50 // 轻微重力效果
  });

  // 点击敌人触发死亡
  enemy.on('pointerdown', () => {
    triggerEnemyDeath.call(this);
  });

  // 添加提示：敌人可以被拖动
  this.input.setDraggable(enemy);
  enemy.on('drag', (pointer, dragX, dragY) => {
    enemy.x = dragX;
    enemy.y = dragY;
  });

  // 添加额外说明文本
  this.add.text(16, 560, 'Tip: You can drag the enemy around before clicking it', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 敌人轻微浮动效果
  if (enemy && enemy.active) {
    enemy.y += Math.sin(time * 0.002) * 0.5;
  }
}

// 触发敌人死亡的函数
function triggerEnemyDeath() {
  if (!enemy || !enemy.active) return;

  // 记录敌人位置
  const deathX = enemy.x;
  const deathY = enemy.y;

  // 增加击杀计数
  killCount++;
  statusText.setText(`Kills: ${killCount}\nParticle explosion in progress!`);

  // 在敌人位置发射粒子爆炸
  particleEmitter.emitParticleAt(deathX, deathY, 20);

  // 销毁敌人精灵（带缩放动画）
  this.tweens.add({
    targets: enemy,
    scale: 0,
    alpha: 0,
    duration: 300,
    ease: 'Power2',
    onComplete: () => {
      enemy.destroy();
      enemy = null;

      // 4秒后重新生成敌人
      this.time.delayedCall(4000, () => {
        respawnEnemy.call(this);
      });
    }
  });

  // 4秒后更新状态文本
  this.time.delayedCall(4000, () => {
    if (statusText) {
      statusText.setText(`Kills: ${killCount}\nClick the yellow enemy to destroy it!`);
    }
  });
}

// 重新生成敌人的函数
function respawnEnemy() {
  if (enemy) return; // 如果敌人已存在，不重复生成

  // 随机位置生成新敌人
  const randomX = Phaser.Math.Between(100, 700);
  const randomY = Phaser.Math.Between(100, 500);

  enemy = this.physics.add.sprite(randomX, randomY, 'yellowEnemy');
  enemy.setInteractive();
  enemy.setScale(1.5);

  // 重新绑定点击事件
  enemy.on('pointerdown', () => {
    triggerEnemyDeath.call(this);
  });

  // 重新设置拖拽
  this.input.setDraggable(enemy);
  enemy.on('drag', (pointer, dragX, dragY) => {
    enemy.x = dragX;
    enemy.y = dragY;
  });

  // 生成动画
  enemy.setScale(0);
  enemy.setAlpha(0);
  this.tweens.add({
    targets: enemy,
    scale: 1.5,
    alpha: 1,
    duration: 500,
    ease: 'Back.easeOut'
  });
}

// 启动游戏
new Phaser.Game(config);