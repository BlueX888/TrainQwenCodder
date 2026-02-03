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

// 状态变量
let killCount = 0;
let particleExplosions = 0;
let statusText;
let enemies = [];
let particleEmitter;

function preload() {
  // 使用Graphics创建紫色敌人纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('purpleEnemy', 32, 32);
  graphics.destroy();
  
  // 创建粒子纹理（小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xe74c3c, 1); // 红色粒子
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建粒子发射器（初始状态关闭）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 3000,
    quantity: 10,
    blendMode: 'ADD',
    emitting: false // 初始不发射
  });
  
  // 创建多个紫色敌人
  for (let i = 0; i < 5; i++) {
    const x = 150 + i * 150;
    const y = 200 + Math.sin(i) * 100;
    const enemy = this.physics.add.sprite(x, y, 'purpleEnemy');
    enemy.setInteractive();
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    
    // 点击敌人触发死亡
    enemy.on('pointerdown', () => {
      killEnemy.call(this, enemy);
    });
    
    enemies.push(enemy);
  }
  
  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();
  
  // 提示文本
  this.add.text(400, 550, '点击紫色敌人触发粒子爆炸效果', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加自动击杀演示（5秒后自动击杀一个敌人）
  this.time.delayedCall(5000, () => {
    if (enemies.length > 0) {
      const randomEnemy = Phaser.Utils.Array.GetRandom(enemies);
      if (randomEnemy && randomEnemy.active) {
        killEnemy.call(this, randomEnemy);
      }
    }
  });
}

function update() {
  // 更新敌人移动（简单的随机移动）
  enemies.forEach(enemy => {
    if (enemy.active) {
      // 随机改变方向
      if (Phaser.Math.Between(0, 100) < 2) {
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(-50, 50)
        );
      }
    }
  });
}

function killEnemy(enemy) {
  if (!enemy.active) return;
  
  const x = enemy.x;
  const y = enemy.y;
  
  // 触发粒子爆炸
  particleEmitter.setPosition(x, y);
  particleEmitter.explode(10); // 一次性发射10个粒子
  
  // 更新状态
  killCount++;
  particleExplosions++;
  
  // 销毁敌人
  enemy.destroy();
  
  // 从数组中移除
  const index = enemies.indexOf(enemy);
  if (index > -1) {
    enemies.splice(index, 1);
  }
  
  // 更新状态文本
  updateStatusText();
  
  // 添加击杀提示文本
  const killText = this.add.text(x, y - 50, 'KILLED!', {
    fontSize: '24px',
    fill: '#ff0000',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 文本淡出动画
  this.tweens.add({
    targets: killText,
    alpha: 0,
    y: y - 100,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => {
      killText.destroy();
    }
  });
  
  // 如果所有敌人都被击杀，重新生成
  if (enemies.length === 0) {
    this.time.delayedCall(2000, () => {
      respawnEnemies.call(this);
    });
  }
}

function respawnEnemies() {
  // 重新生成敌人
  for (let i = 0; i < 5; i++) {
    const x = 150 + i * 150;
    const y = 200 + Math.sin(i) * 100;
    const enemy = this.physics.add.sprite(x, y, 'purpleEnemy');
    enemy.setInteractive();
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    
    enemy.on('pointerdown', () => {
      killEnemy.call(this, enemy);
    });
    
    enemies.push(enemy);
  }
  
  updateStatusText();
}

function updateStatusText() {
  statusText.setText(
    `击杀数: ${killCount} | 粒子爆炸次数: ${particleExplosions} | 剩余敌人: ${enemies.length}`
  );
}

new Phaser.Game(config);