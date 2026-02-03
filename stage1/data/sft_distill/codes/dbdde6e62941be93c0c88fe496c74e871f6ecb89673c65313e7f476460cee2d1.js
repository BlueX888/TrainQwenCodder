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

// 状态信号变量
let enemyDeathCount = 0;
let statusText;
let enemy;
let particleEmitter;

function preload() {
  // 使用 Graphics 创建橙色敌人纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('enemy', 32, 32);
  graphics.destroy();

  // 创建粒子纹理（小橙色圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff6600, 1);
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建橙色敌人
  enemy = this.physics.add.sprite(400, 300, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 创建粒子发射器
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: -1, // 手动发射
    quantity: 12,
    emitting: false
  });

  // 状态显示文本
  statusText = this.add.text(16, 16, 'Enemy Death Count: 0\nPress SPACE to kill enemy', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });

  // 添加键盘输入
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    if (enemy && enemy.active) {
      killEnemy.call(this);
    }
  });

  // 提示文本
  this.add.text(400, 550, 'Press SPACE to trigger particle explosion', {
    fontSize: '16px',
    fill: '#ffff00'
  }).setOrigin(0.5);
}

function killEnemy() {
  if (!enemy || !enemy.active) return;

  // 记录敌人位置
  const x = enemy.x;
  const y = enemy.y;

  // 更新状态
  enemyDeathCount++;
  statusText.setText(`Enemy Death Count: ${enemyDeathCount}\nPress SPACE to kill enemy`);

  // 销毁敌人
  enemy.destroy();

  // 在敌人位置发射粒子
  particleEmitter.setPosition(x, y);
  particleEmitter.explode(12);

  // 2.5秒后重新生成敌人
  this.time.delayedCall(2500, () => {
    respawnEnemy.call(this);
  });
}

function respawnEnemy() {
  // 在随机位置重新生成敌人
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(100, 500);
  
  enemy = this.physics.add.sprite(x, y, 'enemy');
  enemy.setCollideWorldBounds(true);
  
  // 添加闪烁效果表示重生
  this.tweens.add({
    targets: enemy,
    alpha: { from: 0, to: 1 },
    duration: 500,
    ease: 'Power2'
  });
}

function update(time, delta) {
  // 敌人缓慢移动（可选，增加视觉效果）
  if (enemy && enemy.active) {
    const speed = 50;
    const angle = Math.sin(time / 1000) * Math.PI * 2;
    enemy.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
  }
}

const game = new Phaser.Game(config);