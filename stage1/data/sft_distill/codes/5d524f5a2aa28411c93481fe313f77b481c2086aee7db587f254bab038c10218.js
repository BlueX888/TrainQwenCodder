// 全局游戏状态
const gameState = {
  currentLevel: 1,
  maxLevel: 5,
  baseEnemyCount: 12,
  enemyIncrement: 2,
  seed: 12345
};

// 简单的随机数生成器（使用种子）
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化物理世界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();
    this.spawnEnemies();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.updateUI();

    // 游戏结束标志
    this.gameOver = false;
  }

  spawnEnemies() {
    const enemyCount = gameState.baseEnemyCount + (gameState.currentLevel - 1) * gameState.enemyIncrement;
    const random = new SeededRandom(gameState.seed + gameState.currentLevel);
    
    const rows = Math.ceil(enemyCount / 6);
    const cols = Math.min(enemyCount, 6);
    const startX = 100;
    const startY = 80;
    const spacingX = 100;
    const spacingY = 60;

    for (let i = 0; i < enemyCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * spacingX + (random.next() * 40 - 20);
      const y = startY + row * spacingY;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (random.next() * 100 - 50),
        (random.next() * 30 + 20)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否通关
    if (this.enemies.countActive(true) === 0 && !this.gameOver) {
      this.nextLevel();
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`Level: ${gameState.currentLevel}/${gameState.maxLevel}`);
    const remainingEnemies = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${remainingEnemies}`);
  }

  nextLevel() {
    if (gameState.currentLevel >= gameState.maxLevel) {
      this.gameOver = true;
      this.messageText.setText('YOU WIN! All Levels Complete!');
      this.time.delayedCall(3000, () => {
        gameState.currentLevel = 1;
        this.scene.restart();
      });
    } else {
      gameState.currentLevel++;
      this.messageText.setText(`Level ${gameState.currentLevel} Start!`);
      this.time.delayedCall(1500, () => {
        this.messageText.setText('');
        this.scene.restart();
      });
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏状态供验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, gameState };
}