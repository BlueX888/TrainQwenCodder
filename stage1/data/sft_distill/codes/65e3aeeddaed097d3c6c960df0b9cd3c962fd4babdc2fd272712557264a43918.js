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
let enemy = null;
let particleEmitter = null;
let statusText = null;

function preload() {
  // 使用 Graphics 创建粉色敌人纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('pinkEnemy', 40, 40);
  graphics.destroy();

  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4169e1, 1);
  playerGraphics.fillRect(0, 0, 30, 30);
  playerGraphics.generateTexture('player', 30, 30);
  playerGraphics.destroy();

  // 创建粒子纹理（小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff69b4, 1);
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建玩家
  const player = this.physics.add.sprite(100, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建粉色敌人
  enemy = this.physics.add.sprite(400, 300, 'pinkEnemy');
  enemy.setCollideWorldBounds(true);

  // 创建粒子发射器（初始状态关闭）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 1000, // 持续1秒
    gravityY: 0,
    quantity: 20, // 每次发射20个粒子
    frequency: -1, // 手动触发，不自动发射
    blendMode: 'ADD'
  });

  // 创建状态显示文本
  statusText = this.add.text(16, 16, 'Kill Count: 0\nPress SPACE to kill enemy', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });

  // 创建键盘输入
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 监听空格键触发敌人死亡
  spaceKey.on('down', () => {
    if (enemy && enemy.active) {
      killEnemy.call(this);
    }
  });

  // 添加提示文本
  this.add.text(400, 550, 'Press SPACE to trigger particle explosion', {
    fontSize: '18px',
    fill: '#ffff00'
  }).setOrigin(0.5);

  // 添加敌人移动（简单的来回移动）
  this.tweens.add({
    targets: enemy,
    x: 600,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

function update(time, delta) {
  // 更新逻辑（本例中主要通过事件驱动）
}

// 敌人死亡函数
function killEnemy() {
  if (!enemy || !enemy.active) return;

  // 记录敌人位置
  const enemyX = enemy.x;
  const enemyY = enemy.y;

  // 增加击杀计数
  killCount++;
  statusText.setText(`Kill Count: ${killCount}\nPress SPACE to kill enemy`);

  // 隐藏敌人
  enemy.setVisible(false);
  enemy.setActive(false);

  // 在敌人位置触发粒子爆炸
  particleEmitter.setPosition(enemyX, enemyY);
  particleEmitter.explode(20); // 一次性发射20个粒子

  // 1秒后重新生成敌人
  this.time.delayedCall(1000, () => {
    if (enemy) {
      // 随机生成新位置
      const randomX = Phaser.Math.Between(200, 600);
      const randomY = Phaser.Math.Between(150, 450);
      
      enemy.setPosition(randomX, randomY);
      enemy.setVisible(true);
      enemy.setActive(true);

      // 重新启动移动动画
      this.tweens.killTweensOf(enemy);
      this.tweens.add({
        targets: enemy,
        x: enemy.x > 400 ? 200 : 600,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  });

  // 添加屏幕震动效果增强视觉反馈
  this.cameras.main.shake(200, 0.005);

  // 播放音效（使用控制台输出模拟，因为不使用外部资源）
  console.log(`💥 Enemy killed! Total kills: ${killCount}`);
}

// 创建游戏实例
const game = new Phaser.Game(config);