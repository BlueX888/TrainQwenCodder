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
let killCount = 0;
let gameScene;

function preload() {
  // 创建粉色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('pinkEnemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1); // 绿色
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建粒子纹理（小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff69b4, 1); // 粉色粒子
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  gameScene = this;

  // 创建玩家
  const player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  this.player = player;

  // 创建敌人组
  this.enemies = this.physics.add.group();

  // 创建粒子管理器
  this.particleManager = this.add.particles('particle');

  // 创建粒子发射器（初始时不发射）
  this.explosionEmitter = this.particleManager.createEmitter({
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 1000,
    quantity: 20,
    on: false // 初始关闭，手动触发
  });

  // 生成初始敌人
  this.spawnEnemy(200, 150);
  this.spawnEnemy(600, 150);
  this.spawnEnemy(200, 450);
  this.spawnEnemy(600, 450);

  // 设置碰撞检测
  this.physics.add.overlap(
    this.player,
    this.enemies,
    this.handleEnemyCollision,
    null,
    this
  );

  // 键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 显示击杀计数
  this.killText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 显示提示
  this.add.text(400, 550, 'Use Arrow Keys to Move - Touch enemies to destroy them', {
    fontSize: '16px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 定时生成新敌人
  this.time.addEvent({
    delay: 3000,
    callback: this.spawnRandomEnemy,
    callbackScope: this,
    loop: true
  });
}

function update() {
  // 玩家移动控制
  const speed = 200;

  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(speed);
  } else {
    this.player.setVelocityX(0);
  }

  if (this.cursors.up.isDown) {
    this.player.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    this.player.setVelocityY(speed);
  } else {
    this.player.setVelocityY(0);
  }

  // 让敌人缓慢移动（增加游戏趣味性）
  this.enemies.children.entries.forEach(enemy => {
    if (enemy.active) {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        enemy.setVelocity(
          (dx / distance) * 50,
          (dy / distance) * 50
        );
      }
    }
  });
}

// 生成敌人
function spawnEnemy(x, y) {
  const enemy = this.enemies.create(x, y, 'pinkEnemy');
  enemy.setCollideWorldBounds(true);
  enemy.setBounce(1);
}

// 随机位置生成敌人
function spawnRandomEnemy() {
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 确保不在玩家附近生成
  const distance = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
  if (distance > 150) {
    this.spawnEnemy(x, y);
  }
}

// 处理敌人碰撞
function handleEnemyCollision(player, enemy) {
  // 记录敌人位置
  const enemyX = enemy.x;
  const enemyY = enemy.y;

  // 销毁敌人
  enemy.destroy();

  // 触发粒子爆炸效果
  this.explosionEmitter.explode(20, enemyX, enemyY);

  // 增加击杀计数
  killCount++;
  this.killText.setText('Kills: ' + killCount);

  // 播放爆炸音效（使用相机闪烁代替）
  this.cameras.main.flash(200, 255, 105, 180, false);

  // 输出状态信号到控制台
  console.log('Enemy killed! Total kills:', killCount);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getKillCount: () => killCount };
}