class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 10; // 第一关敌人数
    this.enemyIncrement = 2; // 每关增加数量
    this.totalEnemies = 0;
    this.remainingEnemies = 0;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200; // 发射间隔

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    this.gameOver = false;
    this.totalEnemies = this.enemiesPerLevel + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = this.totalEnemies;

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子确保可重现）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < this.totalEnemies; i++) {
      // 使用伪随机位置（基于种子）
      const x = 50 + ((seed + i * 137) % 700);
      const y = 50 + ((seed + i * 211) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 100) - 50,
        ((seed + i * 97) % 50) + 20
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    this.updateUI();
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否通关
    if (this.remainingEnemies === 0) {
      this.levelComplete();
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹和敌人都消失
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    this.remainingEnemies--;
    this.updateUI();
  }

  playerHit(player, enemy) {
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);

    this.statusText.setText('GAME OVER!\nLevel: ' + this.currentLevel);
    this.statusText.setVisible(true);
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.victory = true;
      this.physics.pause();
      this.statusText.setText('VICTORY!\nAll 5 Levels Complete!');
      this.statusText.setVisible(true);
    } else {
      // 进入下一关
      this.currentLevel++;
      this.statusText.setText('Level ' + (this.currentLevel - 1) + ' Complete!\nStarting Level ' + this.currentLevel);
      this.statusText.setVisible(true);

      // 延迟2秒后开始下一关
      this.time.delayedCall(2000, () => {
        this.statusText.setVisible(false);
        this.startLevel();
      });
    }
  }

  updateUI() {
    this.levelText.setText('Level: ' + this.currentLevel + '/' + this.maxLevel);
    this.enemyCountText.setText('Enemies: ' + this.remainingEnemies + '/' + this.totalEnemies);
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

new Phaser.Game(config);