class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 5;
    this.enemyIncrement = 2;
    this.playerSpeed = 200;
    this.bulletSpeed = 400;
    this.enemySpeed = 50;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;
    this.shootDelay = 300;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
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
    }).setOrigin(0.5).setVisible(false);

    // 游戏状态
    this.gameOver = false;
    this.levelComplete = false;

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    this.levelComplete = false;
    this.gameOver = false;
    
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;

    // 生成敌人（使用固定种子确保可重现）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 使用伪随机确保确定性
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 271) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        this.enemySpeed * (((seed + i) % 2) * 2 - 1),
        this.enemySpeed * (((seed + i * 2) % 2) * 2 - 1)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }

    this.updateUI();
    
    // 显示关卡开始提示
    this.statusText.setText(`Level ${this.currentLevel}`);
    this.statusText.setVisible(true);
    this.time.delayedCall(1500, () => {
      this.statusText.setVisible(false);
    });
  }

  update(time, delta) {
    if (this.gameOver || this.levelComplete) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < 0 || bullet.y > 600)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查关卡完成
    if (this.enemies.countActive(true) === 0 && !this.levelComplete) {
      this.levelComplete = true;
      this.completeLevel();
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-this.bulletSpeed);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    this.updateUI();
  }

  hitPlayer(player, enemy) {
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    
    this.statusText.setText('Game Over!\nPress R to Restart');
    this.statusText.setVisible(true);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
      this.currentLevel = 1;
    });
  }

  completeLevel() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.gameOver = true;
      this.physics.pause();
      
      this.statusText.setText('Victory!\nAll Levels Complete!\nPress R to Restart');
      this.statusText.setVisible(true);

      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
        this.currentLevel = 1;
      });
    } else {
      // 进入下一关
      this.currentLevel++;
      this.statusText.setText(`Level ${this.currentLevel - 1} Complete!\nNext Level...`);
      this.statusText.setVisible(true);
      
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    }
  }

  updateUI() {
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    const remaining = this.enemies.countActive(true);
    
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${remaining}/${enemyCount}`);
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);