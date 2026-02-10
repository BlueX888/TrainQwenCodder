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
let enemiesKilled = 0;
let statusText;

function preload() {
  // 创建灰色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x808080, 1); // 灰色
  enemyGraphics.fillCircle(25, 25, 25);
  enemyGraphics.generateTexture('enemy', 50, 50);
  enemyGraphics.destroy();

  // 创建粒子纹理（红色小方块）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff4444, 1);
  particleGraphics.fillRect(0, 0, 8, 8);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 显示状态文本
  statusText = this.add.text(10, 10, 'Enemies Killed: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 创建粒子发射器（初始不发射）
  const particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 3000,
    gravityY: 0,
    quantity: 5,
    frequency: -1, // 手动触发，不自动发射
    blendMode: 'ADD'
  });

  // 创建多个灰色敌人
  const enemies = this.physics.add.group();
  
  // 固定位置创建敌人（确保可预测性）
  const positions = [
    { x: 200, y: 200 },
    { x: 400, y: 200 },
    { x: 600, y: 200 },
    { x: 200, y: 400 },
    { x: 400, y: 400 },
    { x: 600, y: 400 }
  ];

  positions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setInteractive();
    enemy.setCollideWorldBounds(true);
    
    // 设置随机速度（使用固定种子确保可重现）
    const angle = Phaser.Math.Between(0, 360);
    const speed = 50;
    enemy.setVelocity(
      Math.cos(angle * Math.PI / 180) * speed,
      Math.sin(angle * Math.PI / 180) * speed
    );

    // 点击敌人触发死亡
    enemy.on('pointerdown', () => {
      killEnemy(enemy, particleEmitter, this);
    });
  });

  // 添加提示文本
  this.add.text(400, 550, 'Click on gray enemies to kill them', {
    fontSize: '20px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);

  // 敌人碰撞世界边界时反弹
  enemies.children.iterate((enemy) => {
    if (enemy) {
      enemy.setBounce(1, 1);
    }
  });
}

function update() {
  // 更新逻辑（如需要）
}

function killEnemy(enemy, particleEmitter, scene) {
  if (!enemy.active) return;

  // 记录敌人位置
  const x = enemy.x;
  const y = enemy.y;

  // 销毁敌人
  enemy.destroy();

  // 在敌人位置触发粒子爆炸
  particleEmitter.setPosition(x, y);
  particleEmitter.explode(5); // 发射5个粒子

  // 更新状态
  enemiesKilled++;
  statusText.setText(`Enemies Killed: ${enemiesKilled}`);

  // 添加爆炸音效模拟（通过闪烁效果）
  const flash = scene.add.graphics();
  flash.fillStyle(0xffffff, 0.5);
  flash.fillCircle(x, y, 40);
  
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 200,
    onComplete: () => {
      flash.destroy();
    }
  });

  // 控制台输出验证信息
  console.log(`Enemy killed at (${x}, ${y}). Total kills: ${enemiesKilled}`);
}

// 启动游戏
const game = new Phaser.Game(config);