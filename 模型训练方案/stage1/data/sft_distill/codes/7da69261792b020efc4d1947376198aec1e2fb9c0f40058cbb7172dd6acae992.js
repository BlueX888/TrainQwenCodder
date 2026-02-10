class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.remainingEnemies = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化关卡
    this.setupLevel();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成敌人
    this.spawnEnemies();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setVisible(false);

    // 更新UI
    this.updateUI();
  }

  setupLevel() {
    // 计算当前关卡敌人数：第1关5个，每关增加2个
    this.enemiesPerLevel = 5 + (this.currentLevel - 1) * 2;
    this.remainingEnemies = this.enemiesPerLevel;
  }

  spawnEnemies() {
    // 使用固定种子生成敌人位置
    const seed = this.currentLevel * 1000;
    let rng = seed;
    
    const seededRandom = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 在安全区域随机生成敌人位置
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 350;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (seededRandom() - 0.5) * 100,
        (seededRandom() - 0.5) * 100
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }
  }

  hitEnemy(player, enemy) {
    // 消除敌人
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否清除所有敌人
    if (this.remainingEnemies === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);

    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.currentLevel++;
      this.messageText.setText(`关卡 ${this.currentLevel - 1} 完成！\n准备进入关卡 ${this.currentLevel}`);
      this.messageText.setVisible(true);

      this.time.delayedCall(2000, () => {
        this.messageText.setVisible(false);
        this.nextLevel();
      });
    } else {
      // 游戏胜利
      this.messageText.setText('恭喜通关！\n完成全部 5 关');
      this.messageText.setVisible(true);
      this.messageText.setStyle({ fill: '#ffff00' });
    }
  }

  nextLevel() {
    // 清除当前敌人组
    this.enemies.clear(true, true);
    
    // 重置玩家位置
    this.player.setPosition(400, 500);
    this.player.setVelocity(0, 0);

    // 设置新关卡
    this.setupLevel();
    this.spawnEnemies();
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`剩余敌人: ${this.remainingEnemies}/${this.enemiesPerLevel}`);
  }

  update() {
    if (!this.player || !this.player.active) return;

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

const game = new Phaser.Game(config);

// 可验证的状态信号
game.events.on('ready', () => {
  const scene = game.scene.scenes[0];
  console.log('Game State:');
  console.log('- Current Level:', scene.currentLevel);
  console.log('- Max Level:', scene.maxLevel);
  console.log('- Enemies This Level:', scene.enemiesPerLevel);
  console.log('- Remaining Enemies:', scene.remainingEnemies);
});