class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemies = 3;
    this.enemiesPerLevel = 2;
    this.remainingEnemies = 0;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.canShoot = true;
    this.shootDelay = 300;
    this.levelText = null;
    this.enemyCountText = null;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9932cc, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.totalLevels) {
      this.gameCompleted = true;
      this.statusText.setText('GAME COMPLETED!\nAll 5 levels cleared!');
      this.physics.pause();
      return;
    }

    // 计算当前关卡敌人数量
    this.remainingEnemies = this.baseEnemies + (this.currentLevel - 1) * this.enemiesPerLevel;
    
    // 清空旧敌人
    this.enemies.clear(true, true);

    // 生成敌人
    this.spawnEnemies();

    // 更新UI
    this.updateUI();

    // 显示关卡开始信息
    this.statusText.setText(`Level ${this.currentLevel}`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });
  }

  spawnEnemies() {
    const enemyCount = this.baseEnemies + (this.currentLevel - 1) * this.enemiesPerLevel;
    
    // 使用固定随机种子生成确定性位置
    const seed = this.currentLevel * 1000;
    let rng = seed;
    
    const seededRandom = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    for (let i = 0; i < enemyCount; i++) {
      const x = 100 + seededRandom() * 600;
      const y = 50 + seededRandom() * 200;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (seededRandom() - 0.5) * 100,
        (seededRandom() - 0.5) * 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.totalLevels}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
  }

  shoot() {
    if (!this.canShoot || this.gameCompleted) return;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.destroy();
    
    // 减少敌人计数
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否清除所有敌人
    if (this.remainingEnemies <= 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.statusText.setText(`Level ${this.currentLevel} Complete!`);
    
    // 暂停物理
    this.physics.pause();
    
    // 延迟后进入下一关
    this.time.delayedCall(2000, () => {
      this.currentLevel++;
      this.physics.resume();
      this.startLevel();
    });
  }

  update(time, delta) {
    if (this.gameCompleted) return;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.each((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }
}

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

const game = new Phaser.Game(config);